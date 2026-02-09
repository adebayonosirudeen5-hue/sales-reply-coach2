#!/usr/bin/env python3
"""
Sales Reply Coach Backend API Test Suite
Tests user signup, login, and YouTube transcript functionality
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

class SalesReplyCoachTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'SalesReplyCoach-Tester/1.0'
        })
        
        # Test credentials from review request
        self.test_email = f"testuser_{int(time.time())}@example.com"  # Unique email for each test run
        self.test_password = "TestPass123!"
        self.test_name = "Test User"
        self.youtube_test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        
        # Test results tracking
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Auth tokens
        self.supabase_token = None
        self.verification_code = None
        self.session_cookie = None

    def log_test(self, test_name: str, success: bool, message: str = "", details: Dict = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {message}")
        if details:
            print(f"    Details: {json.dumps(details, indent=2)}")

    def make_trpc_request(self, procedure: str, input_data: Dict = None, method: str = "POST") -> Dict[str, Any]:
        """Make a tRPC request"""
        if method == "GET":
            # For queries, use GET with input as query parameter
            url = f"{self.base_url}/api/trpc/{procedure}"
            if input_data:
                import urllib.parse
                query_param = urllib.parse.quote(json.dumps(input_data))
                url += f"?input={query_param}"
            response = self.session.get(url)
        else:
            # For mutations, use POST with proper tRPC format
            url = f"{self.base_url}/api/trpc/{procedure}"
            response = self.session.post(url, json=input_data or {})
        
        try:
            return response.json()
        except:
            return {"error": f"Invalid JSON response: {response.text[:200]}", "status_code": response.status_code}

    def test_server_health(self):
        """Test if server is running and responding"""
        try:
            # Try a simple GET request to the base URL first
            response = self.session.get(f"{self.base_url}/", timeout=10)
            if response.status_code in [200, 404]:  # 404 is OK, means server is running
                self.log_test("Server Health Check", True, f"Server is running (HTTP {response.status_code})")
                return True
            else:
                self.log_test("Server Health Check", False, f"HTTP {response.status_code}: {response.text[:200]}")
        except Exception as e:
            self.log_test("Server Health Check", False, f"Connection error: {str(e)}")
        return False

    def test_user_signup(self):
        """Test user signup with email verification"""
        print(f"\n🔍 Testing user signup for {self.test_email}...")
        
        # Step 1: Send verification code
        signup_data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name
        }
        
        response = self.make_trpc_request("auth.sendVerificationCode", signup_data)
        
        if "result" in response and response["result"].get("data", {}).get("success"):
            self.log_test("Send Verification Code", True, "Verification code sent successfully")
            # Check server logs for the verification code (dev mode)
            time.sleep(1)  # Give server time to log the code
            return True
        else:
            error_msg = response.get("error", {}).get("json", {}).get("message", "Unknown error")
            self.log_test("Send Verification Code", False, f"Signup failed: {error_msg}")
            return False

    def get_verification_code_from_logs(self):
        """Extract verification code from server logs"""
        try:
            import subprocess
            # Get recent server logs
            result = subprocess.run(['tail', '-50', '/var/log/supervisor/backend.log'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                logs = result.stdout
                # Look for verification code pattern
                import re
                code_match = re.search(r'VERIFICATION CODE: (\d{6})', logs)
                if code_match:
                    return code_match.group(1)
                    
                # Alternative pattern
                code_match = re.search(r'Verification code for [^:]+: (\d{6})', logs)
                if code_match:
                    return code_match.group(1)
        except:
            pass
        return None

    def test_verify_code(self):
        """Test email verification code"""
        # Try to get verification code from logs
        self.verification_code = self.get_verification_code_from_logs()
        
        if not self.verification_code:
            # Try common test codes
            test_codes = ["123456", "000000", "111111"]
            for code in test_codes:
                verify_data = {
                    "email": self.test_email,
                    "code": code
                }
                response = self.make_trpc_request("auth.verifyCode", verify_data)
                if "result" in response and response["result"].get("data", {}).get("success"):
                    self.verification_code = code
                    self.log_test("Verify Code", True, f"Email verification successful with code: {code}")
                    return True
            
            self.log_test("Verify Code", False, "No valid verification code found")
            return False
            
        print(f"\n🔍 Testing code verification with code: {self.verification_code}...")
        
        verify_data = {
            "email": self.test_email,
            "code": self.verification_code
        }
        
        response = self.make_trpc_request("auth.verifyCode", verify_data)
        
        if "result" in response and response["result"].get("data", {}).get("success"):
            self.log_test("Verify Code", True, "Email verification successful")
            return True
        else:
            error_msg = response.get("error", {}).get("json", {}).get("message", "Unknown error")
            self.log_test("Verify Code", False, f"Verification failed: {error_msg}")
            return False

    def test_supabase_login(self):
        """Test login with Supabase (simulated)"""
        print(f"\n🔍 Testing Supabase login...")
        
        # For testing, we'll simulate a Supabase token
        # In real scenario, this would come from Supabase auth
        mock_token = "mock_supabase_jwt_token_for_testing"
        
        login_data = {
            "token": mock_token
        }
        
        response = self.make_trpc_request("auth.supabaseLogin", login_data)
        
        if "result" in response and response["result"].get("data", {}).get("success"):
            self.supabase_token = mock_token
            self.log_test("Supabase Login", True, "Login successful")
            return True
        else:
            error_msg = response.get("error", {}).get("json", {}).get("message", "Unknown error")
            # This might fail due to invalid token, which is expected in test environment
            self.log_test("Supabase Login", False, f"Login failed (expected in test): {error_msg}")
            return False

    def test_knowledge_base_endpoints(self):
        """Test knowledge base related endpoints"""
        print(f"\n🔍 Testing knowledge base endpoints...")
        
        # Test getting brain stats (should work without auth for basic check)
        try:
            response = self.make_trpc_request("brain.getStats", {}, "GET")
            if "error" in response:
                error_msg = response["error"].get("json", {}).get("message", "Unknown error")
                if "UNAUTHORIZED" in error_msg or "authentication" in error_msg.lower():
                    self.log_test("Knowledge Base Access", True, "Endpoints require authentication (correct behavior)")
                    return True
                else:
                    self.log_test("Knowledge Base Access", False, f"Unexpected error: {error_msg}")
                    return False
            else:
                self.log_test("Knowledge Base Access", True, "Knowledge base endpoints accessible")
                return True
        except Exception as e:
            self.log_test("Knowledge Base Access", False, f"Error testing knowledge base: {str(e)}")
            return False

    def test_youtube_transcript_direct(self):
        """Test YouTube transcript extraction directly"""
        print(f"\n🔍 Testing YouTube transcript extraction for: {self.youtube_test_url}")
        
        try:
            # Test the videoTranscription module directly by importing it
            import sys
            sys.path.append('/app/server')
            
            # Try to import and test the function
            try:
                from videoTranscription import getYouTubeTranscript
                
                # This will test the actual transcript extraction
                print("Testing YouTube transcript extraction...")
                result = getYouTubeTranscript(self.youtube_test_url)
                
                if result and result.get('transcript') and len(result['transcript']) > 50:
                    self.log_test("YouTube Transcript Extraction", True, 
                                f"Successfully extracted {len(result['transcript'])} characters via {result.get('method', 'unknown')}")
                    return True
                elif result and result.get('method') == 'failed':
                    self.log_test("YouTube Transcript Extraction", False, 
                                "Transcript extraction failed - may need ffmpeg or yt-dlp")
                    return False
                else:
                    self.log_test("YouTube Transcript Extraction", False, 
                                f"Transcript too short or empty: {len(result.get('transcript', '')) if result else 0} chars")
                    return False
                    
            except ImportError as e:
                self.log_test("YouTube Transcript Extraction", False, f"Cannot import videoTranscription module: {e}")
                return False
                
        except Exception as e:
            self.log_test("YouTube Transcript Extraction", False, f"Error testing transcript: {str(e)}")
            return False

    def test_database_connectivity(self):
        """Test database connectivity by checking if endpoints respond appropriately"""
        print(f"\n🔍 Testing database connectivity...")
        
        try:
            # Try to access a database-dependent endpoint
            response = self.make_trpc_request("auth.me", {}, "GET")
            
            # We expect either a valid response or a proper auth error (not a database error)
            if "error" in response:
                error_msg = response["error"].get("json", {}).get("message", "Unknown error")
                if "database" in error_msg.lower() or "connection" in error_msg.lower():
                    self.log_test("Database Connectivity", False, f"Database connection issue: {error_msg}")
                    return False
                else:
                    # Auth error is expected and indicates database is working
                    self.log_test("Database Connectivity", True, "Database is accessible (auth error expected)")
                    return True
            else:
                self.log_test("Database Connectivity", True, "Database connection successful")
                return True
                
        except Exception as e:
            self.log_test("Database Connectivity", False, f"Database connectivity error: {str(e)}")
            return False

    def test_ffmpeg_availability(self):
        """Test if ffmpeg is available for video processing"""
        print(f"\n🔍 Testing ffmpeg availability...")
        
        try:
            import subprocess
            result = subprocess.run(['which', 'ffmpeg'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                # Test ffmpeg version
                version_result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, timeout=5)
                if version_result.returncode == 0:
                    version_line = version_result.stdout.split('\n')[0]
                    self.log_test("FFmpeg Availability", True, f"FFmpeg available: {version_line}")
                    return True
                else:
                    self.log_test("FFmpeg Availability", False, "FFmpeg found but not working")
                    return False
            else:
                self.log_test("FFmpeg Availability", False, "FFmpeg not found in PATH")
                return False
        except Exception as e:
            self.log_test("FFmpeg Availability", False, f"Error checking ffmpeg: {str(e)}")
            return False

    def test_ytdlp_availability(self):
        """Test if yt-dlp is available for video downloading"""
        print(f"\n🔍 Testing yt-dlp availability...")
        
        try:
            import subprocess
            result = subprocess.run(['which', 'yt-dlp'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                # Test yt-dlp version
                version_result = subprocess.run(['yt-dlp', '--version'], capture_output=True, text=True, timeout=10)
                if version_result.returncode == 0:
                    version = version_result.stdout.strip()
                    self.log_test("yt-dlp Availability", True, f"yt-dlp available: {version}")
                    return True
                else:
                    self.log_test("yt-dlp Availability", False, "yt-dlp found but not working")
                    return False
            else:
                self.log_test("yt-dlp Availability", False, "yt-dlp not found in PATH")
                return False
        except Exception as e:
            self.log_test("yt-dlp Availability", False, f"Error checking yt-dlp: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Sales Reply Coach Backend Tests")
        print("=" * 60)
        
        # Core connectivity tests
        if not self.test_server_health():
            print("❌ Server is not responding. Stopping tests.")
            return False
            
        self.test_database_connectivity()
        self.test_environment_variables()
        
        # Authentication flow tests
        self.test_user_signup()
        if self.verification_code:
            self.test_verify_code()
        self.test_supabase_login()
        
        # Feature tests
        self.test_knowledge_base_endpoints()
        self.test_youtube_transcript_capability()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t["success"]]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        # Print passed tests
        passed_tests = [t for t in self.test_results if t["success"]]
        if passed_tests:
            print(f"\n✅ PASSED TESTS ({len(passed_tests)}):")
            for test in passed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = SalesReplyCoachTester()
    
    try:
        success = tester.run_all_tests()
        
        # Save detailed results
        import os
        os.makedirs('/app/test_reports', exist_ok=True)
        with open('/app/test_reports/backend_test_results.json', 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed': tester.tests_passed,
                    'failed': tester.tests_run - tester.tests_passed,
                    'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0
                },
                'test_results': tester.test_results
            }, f, indent=2)
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test runner error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
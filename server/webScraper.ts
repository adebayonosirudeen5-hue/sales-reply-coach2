/**
 * Web Scraping and Content Extraction Service
 * 
 * Scrapes Instagram profiles, stores, and other URLs to extract
 * prospect information for personalized outreach.
 */

import { ENV } from "./_core/env";

interface ScrapedProfile {
  name: string;
  bio: string;
  posts: string[];
  products: string[];
  followers: string;
  engagement: string;
  contentThemes: string[];
  rawHtml?: string;
}

/**
 * Scrape Instagram profile information using oEmbed and public data
 */
export async function scrapeInstagramProfile(url: string): Promise<ScrapedProfile | null> {
  try {
    // Extract username from URL
    const usernameMatch = url.match(/instagram\.com\/([^\/\?]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;
    
    if (!username) return null;

    // Use Instagram oEmbed to get basic info
    const oEmbedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(oEmbedUrl);
      if (response.ok) {
        const data = await response.json();
        return {
          name: data.author_name || username,
          bio: data.title || "",
          posts: [],
          products: [],
          followers: "Unknown",
          engagement: "Unknown",
          contentThemes: [],
        };
      }
    } catch (e) {
      console.log("[Scrape] Instagram oEmbed failed, using username only");
    }

    // Return basic info if oEmbed fails
    return {
      name: username,
      bio: `Instagram profile: @${username}`,
      posts: [],
      products: [],
      followers: "Unknown",
      engagement: "Unknown", 
      contentThemes: [],
    };
  } catch (error) {
    console.error("[Scrape] Instagram scrape failed:", error);
    return null;
  }
}

/**
 * Scrape TikTok profile information
 */
export async function scrapeTikTokProfile(url: string): Promise<ScrapedProfile | null> {
  try {
    const usernameMatch = url.match(/tiktok\.com\/@([^\/\?]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;
    
    if (!username) return null;

    return {
      name: username,
      bio: `TikTok creator: @${username}`,
      posts: [],
      products: [],
      followers: "Unknown",
      engagement: "Unknown",
      contentThemes: [],
    };
  } catch (error) {
    console.error("[Scrape] TikTok scrape failed:", error);
    return null;
  }
}

/**
 * Scrape store/website for product information
 */
export async function scrapeStore(url: string): Promise<{ products: string[]; description: string } | null> {
  try {
    // Try to fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SalesCoachBot/1.0)',
      },
    });

    if (!response.ok) {
      return { products: [], description: `Store at ${url}` };
    }

    const html = await response.text();
    
    // Extract basic info from HTML
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "";
    
    // Look for product-related content
    const productPatterns = [
      /\$\d+(?:\.\d{2})?/g, // Prices
      /product[s]?/gi,
      /shop|store|buy|purchase/gi,
    ];
    
    const hasProducts = productPatterns.some(pattern => pattern.test(html));
    
    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1] : title;

    return {
      products: hasProducts ? ["Products detected on website"] : [],
      description: description || `Store: ${url}`,
    };
  } catch (error) {
    console.error("[Scrape] Store scrape failed:", error);
    return { products: [], description: `Store at ${url}` };
  }
}

/**
 * Extract text from screenshot using OpenAI Vision
 */
export async function extractTextFromScreenshot(imageBase64: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ENV.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a conversation text extractor. Extract ALL text from this screenshot of a messaging conversation.

Format the output as:
[Person A]: message text
[Person B]: message text

Preserve the exact conversation flow and all messages visible in the screenshot.
If you can identify who is the prospect (the person being messaged) vs the user, label them as [Prospect] and [You].`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "Extract all conversation text from this screenshot. Include every message you can see.",
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[OCR] OpenAI Vision failed:", error);
      return "";
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || "";
    
    console.log(`[OCR] Extracted ${extractedText.length} chars from screenshot`);
    return extractedText;
  } catch (error) {
    console.error("[OCR] Screenshot extraction failed:", error);
    return "";
  }
}

/**
 * Analyze prospect from all available data sources
 */
export async function analyzeProspectDeep(
  name: string,
  instagramUrl?: string,
  tiktokUrl?: string,
  storeUrl?: string,
  otherUrl?: string
): Promise<{
  profileSummary: string;
  interests: string[];
  products: string[];
  painPoints: string[];
  communicationStyle: string;
}> {
  const insights: string[] = [];
  const products: string[] = [];
  const interests: string[] = [];

  // Scrape Instagram
  if (instagramUrl) {
    const igData = await scrapeInstagramProfile(instagramUrl);
    if (igData) {
      insights.push(`Instagram (@${igData.name}): ${igData.bio}`);
      if (igData.contentThemes.length > 0) {
        interests.push(...igData.contentThemes);
      }
    }
  }

  // Scrape TikTok
  if (tiktokUrl) {
    const ttData = await scrapeTikTokProfile(tiktokUrl);
    if (ttData) {
      insights.push(`TikTok (@${ttData.name}): ${ttData.bio}`);
    }
  }

  // Scrape Store
  if (storeUrl) {
    const storeData = await scrapeStore(storeUrl);
    if (storeData) {
      insights.push(`Store: ${storeData.description}`);
      products.push(...storeData.products);
    }
  }

  return {
    profileSummary: insights.join("\n") || `Prospect: ${name}`,
    interests,
    products,
    painPoints: [],
    communicationStyle: "Unknown - needs more data",
  };
}

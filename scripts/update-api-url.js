// Get the Vercel deployment URL from environment
const vercelUrl = process.env.VERCEL_URL;

if (!vercelUrl) {
  console.error("VERCEL_URL environment variable is not set");
  process.exit(1);
}

// Create the API URL
const apiUrl = `https://${vercelUrl}`;

// Update the environment variable
process.env.NEXT_PUBLIC_API_URL = apiUrl;

// Log the update
console.log(`Updated NEXT_PUBLIC_API_URL to: ${apiUrl}`);

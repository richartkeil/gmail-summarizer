// Function to get the API key from storage or prompt user if not set
async function getAPIKey() {
  return new Promise((resolve, reject) => {
    // Try to get key from Chrome storage
    chrome.storage.sync.get(['openai_api_key'], function(result) {
      if (result.openai_api_key) {
        // Key exists in storage
        resolve(result.openai_api_key);
      } else {
        // Key doesn't exist, prompt user
        const key = prompt('Please enter your OpenAI API key:');
        if (key) {
          // Save key to storage
          chrome.storage.sync.set({ openai_api_key: key }, function() {
            resolve(key);
          });
        } else {
          reject(new Error('API key is required'));
        }
      }
    });
  });
}

// Calculate the approximate cost of the API call
function calculateCost(inputTokens, outputTokens) {
  // GPT-4o pricing (as of current implementation)
  const inputPricePer1M = 2.50; 
  const outputPricePer1M = 10.00; 
  
  const inputCost = (inputTokens / 1000000) * inputPricePer1M;
  const outputCost = (outputTokens / 1000000) * outputPricePer1M;
  const totalCost = inputCost + outputCost;
  
  return {
    inputTokens,
    outputTokens,
    totalCost: totalCost.toFixed(4)
  };
}

// Rough estimation of token count
function estimateTokenCount(text) {
  // Approximate tokens as 4 characters per token on average
  return Math.ceil(text.length / 4);
}

// Function to summarize email content using OpenAI's GPT-4o
async function summarizeEmail(title, body) {
  try {
    // Get API key
    const apiKey = await getAPIKey();
    
    // Extract text content from HTML
    const textContent = extractTextFromHTML(body);
    
    // Prepare the prompt for OpenAI
    const prompt = `
      Summarize the following email with the subject "${title}":
      
      ${textContent}
      
      Provide a concise summary highlighting the key points, any actions required, and important dates or deadlines.
    `;
    
    // Estimate input tokens
    const systemContent = 'You are a helpful assistant that summarizes emails in concise bullet points. Format your response as an HTML unordered list (<ul><li>point 1</li><li>point 2</li></ul>). Keep each bullet point short and focused. Do not include any text before or after the HTML list.';
    const inputTokens = estimateTokenCount(systemContent) + estimateTokenCount(prompt);
    
    // Make the API request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemContent
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const summaryText = data.choices[0].message.content.trim();
    
    // Get token usage from response or estimate if not provided
    const outputTokens = data.usage ? data.usage.completion_tokens : estimateTokenCount(summaryText);
    const totalInputTokens = data.usage ? data.usage.prompt_tokens : inputTokens;
    
    // Calculate cost
    const { totalCost } = calculateCost(totalInputTokens, outputTokens);
    
    return {
      summary: summaryText,
      cost: `Cost: $${totalCost}`
    };
  } catch (error) {
    console.error('Error summarizing email:', error);
    return {
      summary: `Error: ${error.message}`,
      cost: null
    };
  }
}

// Helper function to extract text from HTML
function extractTextFromHTML(html) {
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(script => script.remove());
  
  // Get the text content
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up the text - remove extra whitespace, etc.
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Expose the summarization function
window.summarizeEmail = summarizeEmail; 
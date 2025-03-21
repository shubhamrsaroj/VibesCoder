const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const sendMessageToChatGPT = async (messages, apiKey) => {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding assistant. Provide clear, concise code examples and explanations. Always format code blocks using markdown triple backticks with the appropriate language specified.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from ChatGPT');
    }

    const data = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.error('Error calling ChatGPT:', error);
    throw error;
  }
}; 
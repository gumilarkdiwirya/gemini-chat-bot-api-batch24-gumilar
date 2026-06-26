const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button[type="submit"]');

const conversation = [];

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });

  input.value = '';
  input.disabled = true;
  submitButton.disabled = true;

  const thinkingMessage = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from server.');
    }

    const data = await response.json().catch(() => null);
    const aiReply = data && typeof data.result === 'string' ? data.result.trim() : '';

    if (!aiReply) {
      throw new Error('Sorry, no response received.');
    }

    conversation.push({ role: 'model', text: aiReply });
    updateMessage(thinkingMessage, aiReply);
  } catch (error) {
    const fallbackMessage = error.message || 'Failed to get response from server.';
    updateMessage(thinkingMessage, fallbackMessage);
  } finally {
    input.disabled = false;
    submitButton.disabled = false;
    input.focus();
  }
});

function appendMessage(sender, text) {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  message.textContent = text;
  chatBox.appendChild(message);
  scrollToBottom();
  return message;
}

function updateMessage(element, text) {
  element.textContent = text;
  scrollToBottom();
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

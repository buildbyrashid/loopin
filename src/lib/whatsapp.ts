import JSZip from "jszip";

export type ChatMessage = { date: string; sender: string; text: string; attachment?: string };

const messageStart = /^\[?(\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)\]?\s[-–]?\s?([^:]+):\s([\s\S]*)$/i;

export function parseWhatsAppChat(contents: string) {
  const messages: ChatMessage[] = [];
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(messageStart);
    if (match) {
      const [, date, time, sender, text] = match;
      const attachment = text.match(/<attached:\s*([^>]+)>/i)?.[1] ?? text.match(/^(.+?)\s+\((?:file\s+)?attached\)$/i)?.[1];
      messages.push({ date: `${date} ${time}`, sender: sender.trim(), text: text.trim(), attachment });
    } else if (messages.length) {
      messages[messages.length - 1].text += `\n${line}`;
    }
  }
  return messages;
}

export async function findWhatsAppChat(zip: JSZip) {
  const textFiles = Object.values(zip.files)
    .filter((file) => !file.dir && /(^|\/)[^/]+\.txt$/i.test(file.name))
    .sort((left, right) => {
      const standard = (name: string) => /(^|\/)\_?chat\.txt$/i.test(name) ? 0 : 1;
      return standard(left.name) - standard(right.name);
    });

  for (const file of textFiles) {
    const contents = await file.async("string");
    const messages = parseWhatsAppChat(contents);
    if (messages.length) return { file, messages };
  }
  return null;
}

export function formatConversation(messages: ChatMessage[]) {
  return messages.map((message) => `[${message.date}] ${message.sender}: ${message.text}`).join("\n");
}

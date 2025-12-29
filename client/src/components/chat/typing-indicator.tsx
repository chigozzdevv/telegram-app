interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null

  const text = usernames.length === 1
    ? `${usernames[0]} is typing`
    : `${usernames.join(', ')} are typing`

  return (
    <div className="py-2 px-4 text-sm text-gray-400 italic">
      {text}...
    </div>
  )
}

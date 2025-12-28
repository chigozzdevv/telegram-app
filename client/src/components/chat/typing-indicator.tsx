interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null

  const text = usernames.length === 1
    ? `${usernames[0]} is typing...`
    : `${usernames.join(', ')} are typing...`

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
      {text}
      <span className="inline-flex ml-1">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce animation-delay-200">.</span>
        <span className="animate-bounce animation-delay-400">.</span>
      </span>
    </div>
  )
}

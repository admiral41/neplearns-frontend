import React from 'react'

export function Tabs({ children, ...props }) {
  return <div {...props}>{children}</div>
}

export function TabsList({ children, ...props }) {
  return <div className="flex gap-2 border-b" {...props}>{children}</div>
}

export function TabsTrigger({ children, value, onClick, ...props }) {
  return (
    <button
      className="px-4 py-2 border-b-2 border-transparent hover:border-primary text-gray-600 data-[state=active]:border-primary data-[state=active]:text-black"
      onClick={onClick}
      data-state={props['data-state']}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, value, ...props }) {
  return <div className="mt-4" {...props}>{children}</div>
}
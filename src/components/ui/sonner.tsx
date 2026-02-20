"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      duration={4000}
      toastOptions={{
        style: {
          background: '#141414',
          color: '#F2F0E4',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '0',
          fontFamily: 'Josefin Sans, sans-serif',
        },
        className: 'art-deco-toast',
      }}
      style={
        {
          "--normal-bg": "#141414",
          "--normal-text": "#F2F0E4",
          "--normal-border": "rgba(212, 175, 55, 0.3)",
          "--success-bg": "#141414",
          "--success-text": "#F2F0E4",
          "--success-border": "rgba(212, 175, 55, 0.5)",
          "--error-bg": "#141414",
          "--error-text": "#F2F0E4",
          "--error-border": "rgba(220, 53, 69, 0.5)",
          "--info-bg": "#141414",
          "--info-text": "#F2F0E4",
          "--info-border": "rgba(30, 61, 89, 0.5)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

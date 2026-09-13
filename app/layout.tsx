import type { Metadata } from 'next';
import './globals.css';
import './product.css';
export const metadata:Metadata={title:'다시봄 · 서평 고쳐쓰기',description:'종이에 쓴 나의 서평, 한 번 더 살펴봐요.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>;}

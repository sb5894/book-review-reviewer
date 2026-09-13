import type { Metadata } from 'next';
import './globals.css';
import './product.css';
export const metadata:Metadata={title:'서평 고쳐쓰기',description:'서평 사진을 올리고 첫 고쳐쓰기 피드백을 확인합니다.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>;}

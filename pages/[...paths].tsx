import React, { useState } from 'react';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import { GetStaticProps, GetStaticPaths } from 'next';
import Header, { Category } from '../app/components/Header';
import DebugOverlay from '../app/components/DebugOverlay';
import Footer from '../app/components/Footer';

export const getStaticPaths: GetStaticPaths = async () => {
  const textsDir = path.join(process.cwd(), 'texts');
  const pathsArr: { params: { paths: string[] } }[] = [];
  if (fs.existsSync(textsDir)) {
    fs.readdirSync(textsDir).forEach((cat) => {
      const catPath = path.join(textsDir, cat);
      if (fs.lstatSync(catPath).isDirectory()) {
        fs.readdirSync(catPath).forEach((file) => {
          if (file.endsWith('.md')) {
            pathsArr.push({ params: { paths: [cat, file.replace('.md', '')] } });
          }
        });
      }
    });
  }
  return { paths: pathsArr, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const [category, slug] = params?.paths as string[];
  const filePath = path.join(process.cwd(), 'texts', category, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContents.split('\n').map((l: string) => l.trim());
  const title = lines[0].startsWith('#') ? lines[0].replace(/^#+\s*/, '') : 'Untitled';
  const date = lines[1] || 'Unknown Date';
  const author = lines[2] || 'Unknown Author';
  const content = lines.slice(3).join('\n').trim();
  return { props: { title, date, author, category, content } };
};

const ArticlePage: React.FC<{
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
}> = ({ title, date, author, category, content }) => {
  const cats: Category[] = [
    { name: 'actu', color: '#f44336' },
    { name: 'interviews & reportage', color: '#3f51b5' },
    { name: 'new', color: '#4caf50' },
    { name: 'design', color: '#ff9800' },
    { name: 'program', color: '#9c27b0' },
    { name: 'livre et film', color: '#009688' },
    { name: 'archives', color: '#607d8b' },
  ];

  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [bodyFontSize, setBodyFontSize] = useState<number>(16);
  const [titleFont, setTitleFont] = useState<'Gaya' | 'Avenir'>('Gaya');
  const [imagePreview, setImagePreview] = useState<boolean>(true);
  const [showArticleSidebar, setShowArticleSidebar] = useState<boolean>(true);

  const mainStyle: React.CSSProperties =
    layout === 'vertical'
      ? { marginLeft: '250px', padding: '20px' }
      : { marginTop: '80px', padding: '20px' };

  return (
    <>
      <Head>
        <title>{title}</title>
        <style>{`
          @font-face {
            font-family: 'AvenirNextCondensed';
            src: url('/fonts/AvenirNextCondensed-Regular.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'GayaRegular';
            src: url('/fonts/gaya-regular.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'AvenirNextBolder';
            src: url('/fonts/AvenirNextCondensed-Regular.otf') format('opentype');
            font-display: swap;
          }
          body {
            margin: 0;
            font-family: 'AvenirNextCondensed', Arial, sans-serif;
          }
        `}</style>
      </Head>
      <div style={{ backgroundColor: '#fff', fontSize: `${bodyFontSize}px` }}>
        <Header categories={cats} layout={layout} />
        <main style={mainStyle}>
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              gap: '20px',
            }}
          >
            <div style={{ flex: 2 }}>
              {imagePreview && (
                <img
                  src="/media/exampleImage.jpg"
                  alt="Article Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '20px',
                  }}
                />
              )}
              <h1
                style={{
                  margin: '0 0 10px',
                  fontFamily: titleFont === 'Gaya' ? 'GayaRegular' : 'AvenirNextBolder',
                }}
              >
                {title}
              </h1>
              <p style={{ margin: '0 0 10px', color: '#555' }}>
                {date} • {author} • {category.charAt(0).toUpperCase() + category.slice(1)}
              </p>
              <div style={{ marginTop: '20px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#333' }}>
                {content}
              </div>
            </div>
            {showArticleSidebar && (
              <aside
                style={{
                  flex: 1,
                  borderLeft: '1px solid #ddd',
                  paddingLeft: '20px',
                }}
              >
                <h4 style={{ marginTop: 0 }}>Article Info</h4>
                <p>
                  <strong>Author:</strong> {author}
                </p>
                <p>
                  <strong>Date:</strong> {date}
                </p>
                <p>
                  <strong>Category:</strong> {category.charAt(0).toUpperCase() + category.slice(1)}
                </p>
                <h4>References</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>
                    <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>
                      Sample Reference 1
                    </a>
                  </li>
                  <li>
                    <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>
                      Sample Reference 2
                    </a>
                  </li>
                  <li>
                    <a href="#" style={{ textDecoration: 'none', color: '#3f51b5' }}>
                      Sample Reference 3
                    </a>
                  </li>
                </ul>
                <h4>Comments</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>
                    <strong>User1:</strong> This is a sample comment.
                  </li>
                  <li>
                    <strong>User2:</strong> Another comment example.
                  </li>
                </ul>
              </aside>
            )}
          </div>
          <Footer />
        </main>
        <DebugOverlay
          layout={layout}
          onToggleLayout={() => setLayout(layout === 'vertical' ? 'horizontal' : 'vertical')}
          bodyFontSize={bodyFontSize}
          onBodyFontSizeChange={setBodyFontSize}
          titleFont={titleFont}
          onTitleFontChange={setTitleFont}
          imagePreview={imagePreview}
          onToggleImagePreview={() => setImagePreview(!imagePreview)}
          articleSidebar={showArticleSidebar}
          onToggleArticleSidebar={() => setShowArticleSidebar(!showArticleSidebar)}
        />
      </div>
    </>
  );
};

export default ArticlePage;

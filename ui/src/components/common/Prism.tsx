import React, { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";

interface PrismCodeProps {
  language: string;
  code: string;
}

const PrismCode: React.FC<PrismCodeProps> = ({ language, code }) => {
  useEffect(() => {
    Prism.highlightAll(); // Highlight all code blocks
  }, [code]);

  return (
    <pre>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};

export default PrismCode;

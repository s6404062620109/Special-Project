import React from 'react'
import ManualRead from './ManualRead'
import PdfRead from './PdfRead';
import TestRead from './TestRead';

function Reader({ 
    content,
    question, 
}) {

  const isPDF = typeof content === 'string' && content.endsWith('.pdf');
  const isManual = typeof content === 'object' && content;
  const isTest = Array.isArray(question) && question.length > 0;

  return (
    <>
      {isManual && <ManualRead subjectInput={content} />}

      {isPDF && <PdfRead fileUrl={content} />}

      {isTest && <TestRead question={question} />}
    </>
  );
}

export default Reader;

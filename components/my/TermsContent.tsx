import { PRIVATE_TERMS } from '@/constants/terms';
import React, { Fragment } from 'react';

const TermsContent = ({ terms }: { terms: typeof PRIVATE_TERMS }) => {
  if (!terms) return null;

  return (
    <div className="border bg-white text-black p-4 rounded-xl pt-10 lg:pt-0">
      <div className="flex flex-col mb-4">
        <h3 className="text-xl font-bold">{terms.title}</h3>
        <p>{terms.body}</p>
      </div>
      {terms.contents.map((content, index) => (
        <Fragment key={index}>
          <h3 className="text-xl font-bold mb-2">{content.title}</h3>
          {content.description.map((term) => (
            <div className="mb-4 text-base" key={term.title}>
              <p className="whitespace-normal break-keep text-[#0700DB] font-bold">
                {term.title}
              </p>
              <p className="whitespace-pre-wrap break-keep font-medium">
                {term.body}
              </p>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
};

export default TermsContent;

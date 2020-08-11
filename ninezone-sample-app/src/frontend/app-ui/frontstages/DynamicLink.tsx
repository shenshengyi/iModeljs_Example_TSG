import { useRef, useState, useCallback, useEffect } from "react";
import React from "react";

interface Props
  extends Omit<React.HTMLProps<HTMLAnchorElement>, "onClick" | "href"> {
  contentGeneratingFn(): Promise<
    { hrefEncodedContent?: string; downloadName: string } | undefined
  >;
}

const DynamicLink = ({ contentGeneratingFn, ...anchorProps }: Props) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [linkContent, setLinkContent] = useState<
    React.HTMLProps<HTMLAnchorElement>
  >({});
  useEffect(() => {
    if (linkContent.href && linkRef.current) {
      linkRef.current.click();
    }
  }, [linkContent]);
  const generateAndDownloadContent = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      contentGeneratingFn().then((generated) => {
        if (
          !generated ||
          !generated.hrefEncodedContent ||
          !generated.downloadName
        ) {
          return;
        }
        setLinkContent({
          href: generated.hrefEncodedContent,
          download: generated.downloadName,
        });
      });
    },
    [contentGeneratingFn]
  );

  return (
    <>
      <a {...anchorProps} onClick={generateAndDownloadContent} href={""} />
      <a
        ref={linkRef}
        style={{ display: "none" }}
        {...linkContent}
        data-testid={"DynamicLink-generated-link"}
      />
    </>
  );
};
export default DynamicLink;

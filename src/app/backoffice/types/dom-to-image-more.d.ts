declare module "dom-to-image-more" {
  interface DomToImageOptions {
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: Partial<CSSStyleDeclaration>;
    filter?: (node: HTMLElement) => boolean;
    quality?: number;
    imagePlaceholder?: string;
    cacheBust?: boolean;
  }

  interface DomToImage {
    toPng(
      node: HTMLElement,
      options?: DomToImageOptions
    ): Promise<string>;

    toJpeg(
      node: HTMLElement,
      options?: DomToImageOptions
    ): Promise<string>;

    toSvg(
      node: HTMLElement,
      options?: DomToImageOptions
    ): Promise<string>;

    toBlob(
      node: HTMLElement,
      options?: DomToImageOptions
    ): Promise<Blob>;

    toPixelData(
      node: HTMLElement,
      options?: DomToImageOptions
    ): Promise<Uint8ClampedArray>;
  }

  const domtoimage: DomToImage;
  export = domtoimage;
}

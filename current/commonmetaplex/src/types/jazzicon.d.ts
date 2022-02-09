declare module 'jazzicon' {
  const jazzicon: any;
  export = jazzicon;
}
declare module '@metamask/jazzicon' {
  const jazzicon: (diameter: number, seed: number | number[]) => HTMLDivElement;
  export = jazzicon;
}

export function requiredElement<T extends Element>(selector: string, type: { new(...args: any[]): T }, root: ParentNode = document): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Project desk is missing ${selector}`);
  return element;
}

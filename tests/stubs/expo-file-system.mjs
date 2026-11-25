// Sem sistema de arquivos do app no Node: os testes não usam fotos.
export class File { constructor() { this.exists = false; this.uri = ''; this.extension = ''; } delete() {} async copy() {} }
export class Directory { create() {} }
export const Paths = { document: '' };

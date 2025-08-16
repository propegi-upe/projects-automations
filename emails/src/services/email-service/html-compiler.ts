export interface HtmlCompiler<T> {
  generateHtml({
    object,
    templatePath,
  }: {
    object: T
    templatePath: string
  }): Promise<string>
}

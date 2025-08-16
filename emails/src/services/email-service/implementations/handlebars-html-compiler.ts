import fs from 'fs/promises'

import handlebars from 'handlebars'

import { HtmlCompiler } from '../html-compiler'

export class HandlebarsHtmlCompiler<T> implements HtmlCompiler<T> {
  async generateHtml({
    object,
    templatePath,
  }: {
    object: T
    templatePath: string
  }): Promise<string> {
    let source

    try {
      source = await fs.readFile(templatePath, 'utf-8')
    } catch (error) {
      console.error(error)
    }

    const template = handlebars.compile(source)

    const result = template(object)

    return result
  }
}

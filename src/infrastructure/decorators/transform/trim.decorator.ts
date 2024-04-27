import { Transform, TransformFnParams } from 'class-transformer'

export const Trim = () => {
  return Transform(({ value }: TransformFnParams) => value.trim())
}

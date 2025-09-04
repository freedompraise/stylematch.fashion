import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'

export const fillForm = async (user: ReturnType<typeof userEvent.setup>, formData: Record<string, string>) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = screen.getByLabelText(new RegExp(field, 'i'))
    await user.type(input, value)
  }
}

export const submitForm = async (user: ReturnType<typeof userEvent.setup>, submitButtonText = "Submit") => {
  const submitButton = screen.getByRole("button", { name: new RegExp(submitButtonText, 'i') })
  await user.click(submitButton)
}

export const selectOption = async (user: ReturnType<typeof userEvent.setup>, label: string, option: string) => {
  const select = screen.getByLabelText(new RegExp(label, 'i'))
  await user.click(select)
  const optionElement = screen.getByRole("option", { name: option })
  await user.click(optionElement)
}

export const uploadFile = async (user: ReturnType<typeof userEvent.setup>, label: string, file: File) => {
  const input = screen.getByLabelText(new RegExp(label, 'i'))
  await user.upload(input, file)
}

export const waitForLoadingToFinish = async () => {
  const loadingElements = screen.queryAllByText(/loading/i)
  if (loadingElements.length > 0) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

export const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

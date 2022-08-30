function fillField(inputEl: HTMLInputElement, text: string) {
    inputEl.value = text
    inputEl.dispatchEvent(new Event('input', { bubbles: true }))
    inputEl.dispatchEvent(new Event('change', { bubbles: true }))
}

export default fillField

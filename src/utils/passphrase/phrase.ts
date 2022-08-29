import words from './words'
import generator from 'generate-password'
import { random } from 'lodash'

export type SeparatorType = '-' | '_' | ',' | '.' | ' ' | 'n' | 'ns'

let _words: string[] = []
function getWords() {
    if (_words.length === 0) {
        _words = words.split(',')
    }
    return _words
}

const numbers = '0123456789'
const symbols = '!@#$%^&*()+_-=}{[]|:;"/?.><,`~'

function Passphrase(count: number, sep: SeparatorType, capitalize?: boolean) {
    if (count < 3) {
        throw new Error('minimum 3 words required')
    }

    const words = getWords()
    let separators: string
    const len = count - 1
    if (sep === 'n') {
        separators = generator.generate({
            length: len,
            numbers: true,
            uppercase: false,
            lowercase: false,
            symbols: false,
        })
    } else if (sep === 'ns') {
        if (len < 3) {
            // fix strict mode not work when length<3
            const s = [numbers[random(9)], symbols[random(29)]]
            const r = random(1, 10)
            separators = s[r % 2] + s[(r + 1) % 2]
        } else {
            separators = generator.generate({
                length: len,
                numbers: true,
                uppercase: false,
                lowercase: false,
                symbols: true,
                strict: true,
            })
        }
    } else {
        separators = sep.repeat(count - 1)
    }
    const nums: number[] = randomNumbers(count, words.length)
    let pass = ''
    const r = random(count - 1)
    nums.forEach(function (item, index) {
        let w = words[item]
        if (capitalize && index === r) {
            w = w.toLocaleUpperCase()
        }
        pass += w
        if (index < count - 1) {
            pass += separators[index]
        }
    })
    return pass
}

function randomNumbers(count: number, bound: number) {
    const nums = []
    while (nums.length < count) {
        const vals = getRandomArray(Uint16Array, count)
        for (let i = 0; i < vals.length; i++) {
            const x = vals[i]
            nums.push(x % bound)
            if (nums.length === count) {
                break
            }
        }
    }
    return nums
}

function getRandomArray(ArrayType: Uint16ArrayConstructor, count: number) {
    const vals = new ArrayType(count)
    window.crypto.getRandomValues(vals)
    return vals
}

export default Passphrase

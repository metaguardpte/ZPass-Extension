const { Translate } = require('@google-cloud/translate').v2
const fs = require('fs')
const path = require('path')

const EXTENSION = '.json'
const supportedLanguages = {
    zh: { locale: 'zh-cn', source: 'en' },
    en: { locale: 'en-us', source: 'zh' },

    de: { locale: 'de-de', source: 'en' },
    fr: { locale: 'fr-fr', source: 'en' },
    it: { locale: 'it-it', source: 'en' },
    es: { locale: 'es-es', source: 'en' },
    pt: { locale: 'pt-pt', source: 'en' },
    ja: { locale: 'ja-jp', source: 'zh' },
    ko: { locale: 'ko-kr', source: 'zh' },
    th: { locale: 'th-th', source: 'zh' },
    ms: { locale: 'ms-my', source: 'zh' },
    vi: { locale: 'vi-vn', source: 'zh' },
    'zh-tw': { locale: 'zh-tw', source: 'zh' },
}

const projectId = 'zeropass-351509'
const translate = new Translate({ projectId })

function prepareTargetFolder(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
    }
}

function getJson(fullName) {
    let json = {}
    if (fs.existsSync(fullName)) {
        const rawData = fs.readFileSync(fullName)
        json = JSON.parse(rawData)
    }
    return json
}

async function translateText(sourceText, sourceLang, targetLang) {
    const [translation] = await translate.translate(sourceText, {
        from: sourceLang,
        to: targetLang,
    })
    console.log(`${sourceLang}=>${targetLang}:${sourceText} => ${translation}`)
    return translation
}

async function translateFile(
    sourceLang,
    targetLang,
    sourceFullName,
    targetFullName
) {
    const sourceObject = getJson(sourceFullName)
    const targetObject = getJson(targetFullName)

    for (const [key, value] of Object.entries(sourceObject)) {
        if (!(key in targetObject)) {
            const translatedValue = await translateText(
                value,
                sourceLang,
                targetLang
            )
            targetObject[key] = translatedValue
        }
    }
    fs.writeFileSync(targetFullName, JSON.stringify(targetObject, null, 4))
}

function updateEntrance(sourceFullName, targetFullFile) {
    if (fs.existsSync(targetFullFile)) {
        fs.truncateSync(targetFullFile)
    }
    const sourceContent = fs.readFileSync(sourceFullName, {
        encoding: 'utf-8',
    })
    fs.writeFileSync(targetFullFile, sourceContent)
}

async function translateRender(language) {
    const rootFolder = path.join(__dirname, 'src', 'i18n', 'locales')
    const source = supportedLanguages[supportedLanguages[language].source]
    const target = supportedLanguages[language]

    const sourceFolder = path.join(rootFolder, source.locale)
    const sourceFiles = fs.readdirSync(sourceFolder)
    const targetFolder = path.join(rootFolder, target.locale)
    for (const file of sourceFiles) {
        if (path.extname(file).toLowerCase() === EXTENSION) {
            const sourceFullName = path.join(sourceFolder, file)
            const targetFullName = path.join(targetFolder, file)
            prepareTargetFolder(targetFolder)
            await translateFile(
                target.source,
                language,
                sourceFullName,
                targetFullName
            )
        }
    }

    const sourceFullName = path.join(sourceFolder, 'index.ts')
    const targetFullName = path.join(targetFolder, 'index.ts')
    updateEntrance(sourceFullName, targetFullName)
}

async function translateWithLanguages(languages) {
    for (const language of languages) {
        if (language === 'en') continue
        await translateRender(language)
    }
}

const args = process.argv.splice(2)
if (args.length === 0) {
    console.error(
        'Please provide the language(s) to be translated, for example: node ./translate.js all'
    )
} else {
    const languageNeeded = []
    if (args.length === 1 && args[0] === 'all') {
        for (const key in supportedLanguages) {
            languageNeeded.push(key)
        }
    } else {
        for (const language of args) {
            if (supportedLanguages[language]) {
                languageNeeded.push(language)
            } else {
                console.log(`Unsupported language: ${language}`)
            }
        }
    }

    if (languageNeeded.length > 0) {
        translateWithLanguages(languageNeeded)
    }
}

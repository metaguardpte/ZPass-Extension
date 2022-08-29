interface ILocalStore {
    language: string
}

class LocalStore implements ILocalStore {
    public get language() {
        return localStorage.getItem('language') ?? 'en'
    }

    public set language(vaule: string) {
        localStorage.setItem('language', vaule)
    }
}

export const localStore = new LocalStore()

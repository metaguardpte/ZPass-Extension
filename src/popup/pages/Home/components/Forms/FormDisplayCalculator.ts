class DynamicFieldLayoutCalculator {
    private mapping: { [k: string]: string[] } = {}
    private radius: string = ''

    constructor(sections: string[][], radius: string = '10px') {
        for (const section of sections) {
            for (const field of section) {
                this.mapping[field] = section
            }
        }
        this.radius = radius
    }

    getFieldRadius(
        field: string,
        sectionData: { [k: string]: any } | undefined
    ) {
        if (!sectionData) return '0'
        const section = [...this.mapping[field]]
        const first = section.find((f) => sectionData[f])
        const last = section.reverse().find((f) => sectionData[f])
        const radiusTop =
            first === field ? `${this.radius} ${this.radius}` : '0 0'
        const radiusBottom =
            last === field ? `${this.radius} ${this.radius}` : '0 0'
        return `${radiusTop} ${radiusBottom}`
    }

    getFieldDisplay(
        field: string,
        sectionData: { [k: string]: any } | undefined
    ) {
        if (!sectionData) return ''
        return sectionData[field] ? '' : 'none'
    }

    getSectionDisplay(
        sect: string[],
        sectionData: { [k: string]: any } | undefined
    ) {
        if (!sectionData) return ''
        return sect.some((f) => sectionData[f]) ? '' : 'none'
    }
}

class StaticFieldLayoutCalculator {
    private sectionData: { [k: string]: any } = {}
    private innerCal: DynamicFieldLayoutCalculator

    constructor(sections: string[][], radius: string = '10px') {
        this.innerCal = new DynamicFieldLayoutCalculator(sections, radius)
    }

    caculateFor(values: { [k: string]: any }) {
        this.sectionData = values
    }

    getFieldRadius(field: string) {
        return this.innerCal.getFieldRadius(field, this.sectionData)
    }

    getFieldDisplay(field: string) {
        return this.innerCal.getFieldDisplay(field, this.sectionData)
    }

    getSectionDisplay(sect: string[]) {
        return this.innerCal.getSectionDisplay(sect, this.sectionData)
    }
}

export { StaticFieldLayoutCalculator, DynamicFieldLayoutCalculator }

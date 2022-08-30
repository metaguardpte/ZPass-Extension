import { __DEV__ } from './utils/constants'

import(`./scripts/${__DEV__ ? 'start' : 'build'}`)

import axios from 'axios'

export function fetchItem() {
    return axios.get('/api/items', param)
}

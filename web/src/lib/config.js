import { API_URL } from './api.js'

// The Mac installer is a GitHub Release file. The backend streams it from GitHub, so the click
// starts a download right away from our own address (no redirect, no GitHub page).
export const DOWNLOAD_URL = `${API_URL}/api/download/app`

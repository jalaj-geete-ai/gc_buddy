import { createContext, useContext } from 'react'

// Lightweight navigation coordinator shared by AppShell and the pages that have
// their own in-page "sub-views" (e.g. the per-level folders in Curriculum,
// Listening and Daily Tests). AppShell provides { pushView, goBack }:
//   pushView(onBack) — register a Back handler + a browser-history entry, so the
//                      system/browser Back button steps back to this view's
//                      parent instead of jumping to Home.
//   goBack()         — drive that same Back flow from an in-app control (e.g. a
//                      "← All levels" button), keeping history in sync.
export const NavContext = createContext(null)
export const useNav = () => useContext(NavContext) || { pushView: () => {}, goBack: () => {} }

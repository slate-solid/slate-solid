import type { JSX } from 'solid-js'
import { Header } from './header'
import { ExampleContent } from './exampleContent'
import { NavBar } from './navBar'

export interface LayoutProps {
  children?: JSX.Element
}

export function Layout(props: LayoutProps) {
  return (
    <div>
      <Header />
      <NavBar />
      <ExampleContent>{props.children}</ExampleContent>
    </div>
  )
}

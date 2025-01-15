import { clamp } from "@samual/lib/clamp"
import { lerp } from "@samual/lib/lerp"
import { shuffle } from "@samual/lib/shuffle"
import { CardStringSuit } from "binmat/common"
import { Cards } from "binmat/makeState"
import { createMemo, createSignal, For } from "solid-js"

const SuitsToColours: Record<CardStringSuit, string> = {
	"!": `#FF0000`,
	"#": `#FF8000`,
	"%": `#00FFFF`,
	"&": `#299400`,
	"+": `#385A6C`,
	"^": `#FFD863`
}

export function App() {
	const [ getClientX, setClientX ] = createSignal(0, { equals: () => false })
	const [ getClientY, setClientY ] = createSignal(0, { equals: () => false })

	let timeoutId: number | undefined

	const resetTimeout = () => {
		clearTimeout(timeoutId)

		timeoutId = setTimeout(() => {
			setClientX(clientX => clientX)
			setClientY(clientY => clientY)
		}, 150)
	}

	addEventListener(`mousemove`, event => {
		resetTimeout()
		setClientX(event.clientX)
		setClientY(event.clientY)
	})

	addEventListener(`touchmove`, event => {
		resetTimeout()
		setClientX(event.touches[0].clientX)
		setClientY(event.touches[0].clientY)
	})

	const [ getInnerWidth, setInnerWidth ] = createSignal(innerWidth)
	const [ getInnerHeight, setInnerHeight ] = createSignal(innerHeight)

	addEventListener(`resize`, () => {
		setInnerWidth(innerWidth)
		setInnerHeight(innerHeight)
	})

	return <>
		<For each={shuffle([ ...Cards ])}>
			{card => {
				const [ getDragging, setDragging ] = createSignal(false)

				const getLeft = createMemo((previous: { offset: number, difference: number, idle: boolean }) => {
					if (getDragging()) {
						const offset = getClientX() / getInnerWidth()

						if (previous.idle)
							return { offset, difference: 0, idle: false }

						return { offset, difference: offset - previous.offset, idle: false }
					}

					return { offset: previous.offset, difference: 0, idle: true }
				}, { offset: Math.random(), difference: 0, idle: true })

				const getTop = createMemo((previous: { offset: number, difference: number, idle: boolean }) => {
					if (getDragging()) {
						const offset = getClientY() / getInnerHeight()

						if (previous.idle)
							return { offset, difference: 0, idle: false }

						return { offset, difference: previous.offset - offset, idle: false }
					}

					return { offset: previous.offset, difference: 0, idle: true }
				}, { offset: Math.random(), difference: 0, idle: true })

				return <div style={{
					position: `absolute`,
					perspective: `600px`,
					left: `clamp(0vmin, ${getLeft().offset * 100}% - 5vmin, 100vw - 10vmin)`,
					top: `clamp(0vmin, ${getTop().offset * 100}% - 7vmin, 100vh - 14vmin)`,
					"z-index": getDragging() ? 1 : 0,
				}}>
					<div
						style={{
							"font-family": "WhiteRabbit, monospace",
							background: SuitsToColours[card[1] as CardStringSuit],
							color: `white`,
							width: `10vmin`,
							height: `14vmin`,
							"text-align": `center`,
							"font-size": `5vmin`,
							display: `flex`,
							"justify-content": `center`,
							"flex-direction": `column`,
							"border-radius": `.5rem`,
							"user-select": `none`,
							"box-shadow": `0 0 1rem ${SuitsToColours[card[1] as CardStringSuit]}80`,
							transform: getDragging()
								? `scale(1.1) rotateY(${
									clamp(getLeft().difference * 8, -.2, .2)
								}turn) rotateX(${
									clamp(getTop().difference * 4, -.2, .2)
								}turn) rotate(${
									clamp(getLeft().difference * 8, -.2, .2) + lerp(-.03, .03, getLeft().offset)
								}turn)`
								: `rotate(${lerp(-.03, .03, getLeft().offset)}turn)`,
							border: `2px solid white`,
							transition: `transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)`
						}}
						onMouseDown={() => {
							resetTimeout()
							setDragging(true)
						}}
						onTouchStart={event => {
							setClientX(event.touches[0].clientX)
							setClientY(event.touches[0].clientY)
							resetTimeout()
							setDragging(true)
						}}
						onMouseUp={() => setDragging(false)}
						onTouchEnd={(() => setDragging(false))}
					><div>{card[0]}</div><div>{card[1]}</div></div>
				</div>
			}}
		</For>
	</>
}

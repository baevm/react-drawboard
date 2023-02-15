import * as Slider from '@radix-ui/react-slider'
import ItemLabel from '../ItemLabel'
import styles from './OpacitySlider.module.css'

export const OpacitySlider = () => {
  return (
    <>
      <ItemLabel>Line opacity</ItemLabel>
      <Slider.Root
        className={styles.SliderRoot}
        defaultValue={[100]}
        min={0}
        max={100}
        step={10}
        aria-label='Line opacity'>
        <Slider.Track className={styles.SliderTrack}>
          <Slider.Range className={styles.SliderRange} />
        </Slider.Track>
        <Slider.Thumb className={styles.SliderThumb} />
      </Slider.Root>
    </>
  )
}

import { useTools } from '@/hooks/useTools'
import * as Slider from '@radix-ui/react-slider'
import ItemLabel from '../ItemLabel'
import styles from './OpacitySlider.module.css'

export const OpacitySlider = () => {
  const { options, setOptions } = useTools((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))

  const handleChange = (value: number[]) => {
    setOptions({ lineOpacity: value[0] })
  }

  return (
    <>
      <ItemLabel>Stroke opacity</ItemLabel>
      <Slider.Root
        className={styles.SliderRoot}
        onValueChange={handleChange}
        defaultValue={[options.lineOpacity]}
        min={0.2}
        max={1}
        step={0.2}
        aria-label='Stroke opacity'>
        <Slider.Track className={styles.SliderTrack}>
          <Slider.Range className={styles.SliderRange} />
        </Slider.Track>
        <Slider.Thumb className={styles.SliderThumb} />
      </Slider.Root>
    </>
  )
}

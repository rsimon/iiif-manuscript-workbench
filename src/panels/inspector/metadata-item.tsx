import type { CozyMetadata } from 'cozy-iiif';

interface MetadataItemProps {

  item: CozyMetadata;

}

export const MetadataItem = (props: MetadataItemProps) => {  

  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{props.item.label}</span>
      <p className="text-xs leading-relaxed">{props.item.value}</p>
    </div>
  )
  
}

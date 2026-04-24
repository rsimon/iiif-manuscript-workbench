interface MetadataFieldProps {

  label: string;

  value: string; 

  multiline?: string;

}

export const MetadataField = (props: MetadataFieldProps) => {

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{props.label}</div>
      <p
        className={`text-sm ${props.multiline ? 'leading-relaxed' : ''}`}>
        {props.value}
      </p>
    </div>
  )
  
}
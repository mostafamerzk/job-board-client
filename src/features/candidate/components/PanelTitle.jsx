export function PanelTitle({ icon, title }) {
  return (
    <div className="panel-header">
      {icon}
      <h3>{title}</h3>
    </div>
  )
}

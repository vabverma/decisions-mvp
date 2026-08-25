interface InfoTooltipProps {
  text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <span className="info-tooltip" tabIndex={0}>
      <span className="info-tooltip-icon">i</span>
      <span className="info-tooltip-bubble">{text}</span>
    </span>
  );
}

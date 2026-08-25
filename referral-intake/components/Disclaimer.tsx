import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

export function Disclaimer() {
  return (
    <div className="disclaimer" role="note">
      <span className="icon">
        <WarningCircle weight="fill" size={18} />
      </span>
      <span>
        <strong>Demo only — do not enter real patient information.</strong> Referral text is sent to a third-party AI
        service without a signed BAA. Use the sample referrals or synthetic text while evaluating this tool.
      </span>
    </div>
  );
}

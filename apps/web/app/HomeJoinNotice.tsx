import styles from "./HomePage.module.css";

type HomeJoinNoticeProps = Readonly<{
  tone: "info" | "success" | "error";
  message: string;
  onClose?: () => void;
}>;

const toneClassMap: Record<HomeJoinNoticeProps["tone"], string> = {
  info: styles.joinNoticeInfo,
  success: styles.joinNoticeSuccess,
  error: styles.joinNoticeError,
};

export function HomeJoinNotice({ tone, message, onClose }: HomeJoinNoticeProps) {
  return (
    <div className={`${styles.joinNotice} ${toneClassMap[tone]}`}>
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className={styles.joinNoticeClose}
        >
          ×
        </button>
      )}
    </div>
  );
}

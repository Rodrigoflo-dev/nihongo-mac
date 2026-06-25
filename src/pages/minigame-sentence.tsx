import { PhraseQuizGame } from "@/components/play/phrase-quiz-game";
import { SENTENCE_COMPLETE } from "@/lib/play-extra";

export default function SentenceCompleteGame() {
  return (
    <PhraseQuizGame
      baseKey="sentence_complete"
      titleJp="文を完成"
      title="Completa la frase"
      description="Elige la partícula o palabra que completa la frase. Repasa は・が・を・に・で・へ en contexto."
      items={SENTENCE_COMPLETE}
      audio={false}
      accentChar="文"
    />
  );
}

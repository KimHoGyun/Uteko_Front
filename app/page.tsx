"use client"; // 이 페이지가 Client Component임을 명시합니다.

import { useState } from 'react';

// 백엔드(Spring)의 Rank enum과 타입을 맞춥니다.
interface Rank {
    description: string;
    // 필요시 prizeMoney 등 다른 필드도 추가
}

// 백엔드의 LottoResultDto와 타입을 맞춥니다.
interface LottoResult {
    userLottoNumbers: string;
    rank: Rank | string; // Rank 객체 또는 "MISS" 문자열
    prize: number;
    errorMessage?: string; // null일 수 있는 필드
}

export default function LottoCheckerPage() {
    const [lottoInput, setLottoInput] = useState('1,2,3,4,5,6\n7,8,9,10,11,12');
    const [results, setResults] = useState<LottoResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLottoInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResults([]);
        setError(null);

        // java-calculator-8의 입력값 처리 방식처럼
        // 줄바꿈으로 입력된 문자열을 파싱하여 배열로 만듭니다.
        const userLottoStrings = lottoInput
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0); // 비어있는 줄은 제거

        if (userLottoStrings.length === 0) {
            setError('입력된 로또 번호가 없습니다.');
            setIsLoading(false);
            return;
        }

        try {
            // uteko_back Spring Boot API (기본 8080 포트) 호출
            const response = await fetch('http://localhost:8080/api/lotto/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userLottoStrings }),
            });

            if (!response.ok) {
                throw new Error('서버 응답 오류 (uteko_back 실행 상태 확인)');
            }

            const data: LottoResult[] = await response.json();
            setResults(data); // 백엔드 결과(List<LottoResultDto>)를 상태에 저장

        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // uteko_front의 기본 레이아웃과 Tailwind CSS를 활용
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 md:p-24 bg-zinc-50 dark:bg-black font-sans">
            <div className="w-full max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-4">
                    로또 당첨 번호 확인
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                    한 줄에 로또 번호 6개를 쉼표(,)로 구분하여 입력하세요.<br/>
                    (백엔드: Uteko_Back, 프론트: Uteko_Front)
                </p>

                <form onSubmit={handleSubmit}>
          <textarea
              value={lottoInput}
              onChange={handleInputChange}
              rows={8}
              placeholder="예: 1,2,3,4,5,6&#10;7,8,9,10,11,12"
              className="w-full p-4 border border-zinc-300 rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black dark:text-white"
          />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-zinc-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '확인 중...' : '결과 확인하기'}
                    </button>
                </form>

                {error && <p className="mt-4 text-red-600 dark:text-red-500 font-medium">{error}</p>}

                {/* java-lotto-8의 당첨 통계 출력과 유사한 결과 렌더링 */}
                {results.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">당첨 결과</h2>
                        <div className="overflow-x-auto shadow-md rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                                <thead className="bg-zinc-100 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">제출 번호</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">결과</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">당첨금</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">비고 (유효성 검사)</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                                {results.map((result, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{result.userLottoNumbers}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                            {typeof result.rank === 'object' ? result.rank.description : result.rank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{result.prize.toLocaleString()}원</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-red-600 dark:text-red-500 text-sm">
                                            {result.errorMessage || ''}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
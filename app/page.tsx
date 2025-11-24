"use client";

import { useState } from 'react';

// 당첨번호 정보
interface WinningNumbers {
    winningNumbers: number[];
    bonusNumber: number;
    drwNo: number;
    firstPrize: number;
}

// Rank
interface Rank {
    description: string;
}

// 로또 결과
interface LottoResult {
    userLottoNumbers: string;
    rank: Rank | string;
    prize: number;
    errorMessage?: string;
}

// 백엔드 응답 단입니니니다
interface LottoCheckResponse {
    winningNumbers: WinningNumbers;
    results: LottoResult[];
}

export default function LottoCheckerPage() {
    const [lottoInput, setLottoInput] = useState('1,2,3,4,5,6\n7,8,9,10,11,12');
    const [winningNumbers, setWinningNumbers] = useState<WinningNumbers | null>(null);
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
        setWinningNumbers(null);
        setError(null);

        const userLottoStrings = lottoInput
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (userLottoStrings.length === 0) {
            setError('입력된 로또 번호가 없습니다.');
            setIsLoading(false);
            return;
        }

        try {
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

            const data: LottoCheckResponse = await response.json();
            setWinningNumbers(data.winningNumbers);
            setResults(data.results);

        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 md:p-24 bg-zinc-50 dark:bg-black font-sans">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-4">
                    로또 당첨 번호 확인
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                    한 줄에 로또 번호 6개를 쉼표(,)로 구분하여 입력하세요.
                </p>

                {/* 당첨번호 표시 영역 */}
                {winningNumbers && (
                    <div className="mb-8 p-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                제 {winningNumbers.drwNo}회 당첨번호
                            </h2>
                            <p className="text-white text-opacity-90 text-sm">
                                1등 상금: {winningNumbers.firstPrize.toLocaleString()}원
                            </p>
                        </div>

                        <div className="flex justify-center items-center gap-3 flex-wrap">
                            {winningNumbers.winningNumbers.map((num, index) => (
                                <div
                                    key={index}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                                >
                                    <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                                        {num}
                                    </span>
                                </div>
                            ))}

                            <div className="w-8 h-8 flex items-center justify-center">
                                <span className="text-3xl text-white font-bold">+</span>
                            </div>

                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-4 border-white">
                                <span className="text-2xl sm:text-3xl font-bold text-white">
                                    {winningNumbers.bonusNumber}
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-white text-sm mt-4 opacity-90">
                            보너스 번호
                        </p>
                    </div>
                )}

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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">비고</th>
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
import React from 'react';

interface CapturedPiecesDisplayProps {
  capturedPieces: Array<{
    type: 'PAWN' | 'ROOK' | 'KNIGHT' | 'BISHOP' | 'QUEEN' | 'KING';
    color: 'WHITE' | 'BLACK';
  }>;
  color: 'WHITE' | 'BLACK';
}

const piecePoints = {
  PAWN: 1,
  ROOK: 5,
  KNIGHT: 3,
  BISHOP: 3,
  QUEEN: 8,
  KING: 0
};

const pieceSymbols = {
  PAWN: '♟',
  ROOK: '♜',
  KNIGHT: '♞',
  BISHOP: '♝',
  QUEEN: '♛',
  KING: '♚'
};

const CapturedPiecesDisplay = ({ capturedPieces, color }: CapturedPiecesDisplayProps) => {
  const totalPoints = capturedPieces.reduce((sum, piece) => sum + piecePoints[piece.type], 0);

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-2 min-h-[100px] w-full">

      
      <div className="flex flex-wrap gap-1 mb-2">
        {capturedPieces.map((piece, index) => (
          <span
            key={index}
            className={`text-2xl ${
              color === 'WHITE' 
                ? 'text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]' 
                : 'text-black'
            }`}
          >
            {pieceSymbols[piece.type]}
          </span>
        ))}
      </div>
      
      <p className="text-sm font-bold text-gray-600">
        Points: {totalPoints}
      </p>
    </div>
  );
};

export default CapturedPiecesDisplay;
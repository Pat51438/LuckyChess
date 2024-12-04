/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateBoardInput = {
  id?: string | null,
  turnNumber: number,
  gameType: string,
};

export type ModelBoardConditionInput = {
  turnNumber?: ModelIntInput | null,
  gameType?: ModelStringInput | null,
  and?: Array< ModelBoardConditionInput | null > | null,
  or?: Array< ModelBoardConditionInput | null > | null,
  not?: ModelBoardConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Board = {
  __typename: "Board",
  id: string,
  players?: ModelPlayerConnection | null,
  pieces?: ModelPieceConnection | null,
  turnNumber: number,
  gameType: string,
  createdAt: string,
  updatedAt: string,
};

export type ModelPlayerConnection = {
  __typename: "ModelPlayerConnection",
  items:  Array<Player | null >,
  nextToken?: string | null,
};

export type Player = {
  __typename: "Player",
  id: string,
  score: number,
  createdAt: string,
  updatedAt: string,
  boardPlayersId?: string | null,
};

export type ModelPieceConnection = {
  __typename: "ModelPieceConnection",
  items:  Array<Piece | null >,
  nextToken?: string | null,
};

export type Piece = {
  __typename: "Piece",
  id: string,
  type: string,
  color: string,
  x: string,
  y: string,
  createdAt: string,
  updatedAt: string,
  boardPiecesId?: string | null,
};

export type UpdateBoardInput = {
  id: string,
  turnNumber?: number | null,
  gameType?: string | null,
};

export type DeleteBoardInput = {
  id: string,
};

export type CreatePlayerInput = {
  id?: string | null,
  score: number,
  boardPlayersId?: string | null,
};

export type ModelPlayerConditionInput = {
  score?: ModelIntInput | null,
  and?: Array< ModelPlayerConditionInput | null > | null,
  or?: Array< ModelPlayerConditionInput | null > | null,
  not?: ModelPlayerConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  boardPlayersId?: ModelIDInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type UpdatePlayerInput = {
  id: string,
  score?: number | null,
  boardPlayersId?: string | null,
};

export type DeletePlayerInput = {
  id: string,
};

export type CreatePieceInput = {
  id?: string | null,
  type: string,
  color: string,
  x: string,
  y: string,
  boardPiecesId?: string | null,
};

export type ModelPieceConditionInput = {
  type?: ModelStringInput | null,
  color?: ModelStringInput | null,
  x?: ModelStringInput | null,
  y?: ModelStringInput | null,
  and?: Array< ModelPieceConditionInput | null > | null,
  or?: Array< ModelPieceConditionInput | null > | null,
  not?: ModelPieceConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  boardPiecesId?: ModelIDInput | null,
};

export type UpdatePieceInput = {
  id: string,
  type?: string | null,
  color?: string | null,
  x?: string | null,
  y?: string | null,
  boardPiecesId?: string | null,
};

export type DeletePieceInput = {
  id: string,
};

export type CreateBoardPlayerInput = {
  id?: string | null,
  timeLeft: number,
  boardPlayerPlayerId?: string | null,
};

export type ModelBoardPlayerConditionInput = {
  timeLeft?: ModelIntInput | null,
  and?: Array< ModelBoardPlayerConditionInput | null > | null,
  or?: Array< ModelBoardPlayerConditionInput | null > | null,
  not?: ModelBoardPlayerConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  boardPlayerPlayerId?: ModelIDInput | null,
};

export type BoardPlayer = {
  __typename: "BoardPlayer",
  id: string,
  player?: Player | null,
  timeLeft: number,
  createdAt: string,
  updatedAt: string,
  boardPlayerPlayerId?: string | null,
};

export type UpdateBoardPlayerInput = {
  id: string,
  timeLeft?: number | null,
  boardPlayerPlayerId?: string | null,
};

export type DeleteBoardPlayerInput = {
  id: string,
};

export type ModelBoardFilterInput = {
  id?: ModelIDInput | null,
  turnNumber?: ModelIntInput | null,
  gameType?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelBoardFilterInput | null > | null,
  or?: Array< ModelBoardFilterInput | null > | null,
  not?: ModelBoardFilterInput | null,
};

export type ModelBoardConnection = {
  __typename: "ModelBoardConnection",
  items:  Array<Board | null >,
  nextToken?: string | null,
};

export type ModelPlayerFilterInput = {
  id?: ModelIDInput | null,
  score?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelPlayerFilterInput | null > | null,
  or?: Array< ModelPlayerFilterInput | null > | null,
  not?: ModelPlayerFilterInput | null,
  boardPlayersId?: ModelIDInput | null,
};

export type ModelPieceFilterInput = {
  id?: ModelIDInput | null,
  type?: ModelStringInput | null,
  color?: ModelStringInput | null,
  x?: ModelStringInput | null,
  y?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelPieceFilterInput | null > | null,
  or?: Array< ModelPieceFilterInput | null > | null,
  not?: ModelPieceFilterInput | null,
  boardPiecesId?: ModelIDInput | null,
};

export type ModelBoardPlayerFilterInput = {
  id?: ModelIDInput | null,
  timeLeft?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelBoardPlayerFilterInput | null > | null,
  or?: Array< ModelBoardPlayerFilterInput | null > | null,
  not?: ModelBoardPlayerFilterInput | null,
  boardPlayerPlayerId?: ModelIDInput | null,
};

export type ModelBoardPlayerConnection = {
  __typename: "ModelBoardPlayerConnection",
  items:  Array<BoardPlayer | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionBoardFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  turnNumber?: ModelSubscriptionIntInput | null,
  gameType?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionBoardFilterInput | null > | null,
  or?: Array< ModelSubscriptionBoardFilterInput | null > | null,
  boardPlayersId?: ModelSubscriptionIDInput | null,
  boardPiecesId?: ModelSubscriptionIDInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionPlayerFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  score?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPlayerFilterInput | null > | null,
  or?: Array< ModelSubscriptionPlayerFilterInput | null > | null,
};

export type ModelSubscriptionPieceFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  type?: ModelSubscriptionStringInput | null,
  color?: ModelSubscriptionStringInput | null,
  x?: ModelSubscriptionStringInput | null,
  y?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPieceFilterInput | null > | null,
  or?: Array< ModelSubscriptionPieceFilterInput | null > | null,
};

export type ModelSubscriptionBoardPlayerFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  timeLeft?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionBoardPlayerFilterInput | null > | null,
  or?: Array< ModelSubscriptionBoardPlayerFilterInput | null > | null,
  boardPlayerPlayerId?: ModelSubscriptionIDInput | null,
};

export type CreateBoardMutationVariables = {
  input: CreateBoardInput,
  condition?: ModelBoardConditionInput | null,
};

export type CreateBoardMutation = {
  createBoard?:  {
    __typename: "Board",
    id: string,
    players?:  {
      __typename: "ModelPlayerConnection",
      nextToken?: string | null,
    } | null,
    pieces?:  {
      __typename: "ModelPieceConnection",
      nextToken?: string | null,
    } | null,
    turnNumber: number,
    gameType: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateBoardMutationVariables = {
  input: UpdateBoardInput,
  condition?: ModelBoardConditionInput | null,
};

export type UpdateBoardMutation = {
  updateBoard?:  {
    __typename: "Board",
    id: string,
    players?:  {
      __typename: "ModelPlayerConnection",
      nextToken?: string | null,
    } | null,
    pieces?:  {
      __typename: "ModelPieceConnection",
      nextToken?: string | null,
    } | null,
    turnNumber: number,
    gameType: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteBoardMutationVariables = {
  input: DeleteBoardInput,
  condition?: ModelBoardConditionInput | null,
};

export type DeleteBoardMutation = {
  deleteBoard?:  {
    __typename: "Board",
    id: string,
    players?:  {
      __typename: "ModelPlayerConnection",
      nextToken?: string | null,
    } | null,
    pieces?:  {
      __typename: "ModelPieceConnection",
      nextToken?: string | null,
    } | null,
    turnNumber: number,
    gameType: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreatePlayerMutationVariables = {
  input: CreatePlayerInput,
  condition?: ModelPlayerConditionInput | null,
};

export type CreatePlayerMutation = {
  createPlayer?:  {
    __typename: "Player",
    id: string,
    score: number,
    createdAt: string,
    updatedAt: string,
    boardPlayersId?: string | null,
  } | null,
};

export type UpdatePlayerMutationVariables = {
  input: UpdatePlayerInput,
  condition?: ModelPlayerConditionInput | null,
};

export type UpdatePlayerMutation = {
  updatePlayer?:  {
    __typename: "Player",
    id: string,
    score: number,
    createdAt: string,
    updatedAt: string,
    boardPlayersId?: string | null,
  } | null,
};

export type DeletePlayerMutationVariables = {
  input: DeletePlayerInput,
  condition?: ModelPlayerConditionInput | null,
};

export type DeletePlayerMutation = {
  deletePlayer?:  {
    __typename: "Player",
    id: string,
    score: number,
    createdAt: string,
    updatedAt: string,
    boardPlayersId?: string | null,
  } | null,
};

export type CreatePieceMutationVariables = {
  input: CreatePieceInput,
  condition?: ModelPieceConditionInput | null,
};

export type CreatePieceMutation = {
  createPiece?:  {
    __typename: "Piece",
    id: string,
    type: string,
    color: string,
    x: string,
    y: string,
    createdAt: string,
    updatedAt: string,
    boardPiecesId?: string | null,
  } | null,
};

export type UpdatePieceMutationVariables = {
  input: UpdatePieceInput,
  condition?: ModelPieceConditionInput | null,
};

export type UpdatePieceMutation = {
  updatePiece?:  {
    __typename: "Piece",
    id: string,
    type: string,
    color: string,
    x: string,
    y: string,
    createdAt: string,
    updatedAt: string,
    boardPiecesId?: string | null,
  } | null,
};

export type DeletePieceMutationVariables = {
  input: DeletePieceInput,
  condition?: ModelPieceConditionInput | null,
};

export type DeletePieceMutation = {
  deletePiece?:  {
    __typename: "Piece",
    id: string,
    type: string,
    color: string,
    x: string,
    y: string,
    createdAt: string,
    updatedAt: string,
    boardPiecesId?: string | null,
  } | null,
};

export type CreateBoardPlayerMutationVariables = {
  input: CreateBoardPlayerInput,
  condition?: ModelBoardPlayerConditionInput | null,
};

export type CreateBoardPlayerMutation = {
  createBoardPlayer?:  {
    __typename: "BoardPlayer",
    id: string,
    player?:  {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null,
    timeLeft: number,
    createdAt: string,
    updatedAt: string,
    boardPlayerPlayerId?: string | null,
  } | null,
};

export type UpdateBoardPlayerMutationVariables = {
  input: UpdateBoardPlayerInput,
  condition?: ModelBoardPlayerConditionInput | null,
};

export type UpdateBoardPlayerMutation = {
  updateBoardPlayer?:  {
    __typename: "BoardPlayer",
    id: string,
    player?:  {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null,
    timeLeft: number,
    createdAt: string,
    updatedAt: string,
    boardPlayerPlayerId?: string | null,
  } | null,
};

export type DeleteBoardPlayerMutationVariables = {
  input: DeleteBoardPlayerInput,
  condition?: ModelBoardPlayerConditionInput | null,
};

export type DeleteBoardPlayerMutation = {
  deleteBoardPlayer?:  {
    __typename: "BoardPlayer",
    id: string,
    player?:  {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null,
    timeLeft: number,
    createdAt: string,
    updatedAt: string,
    boardPlayerPlayerId?: string | null,
  } | null,
};

export type GetBoardQueryVariables = {
  id: string,
};

export type GetBoardQuery = {
  getBoard?:  {
    __typename: "Board",
    id: string,
    players?:  {
      __typename: "ModelPlayerConnection",
      nextToken?: string | null,
    } | null,
    pieces?:  {
      __typename: "ModelPieceConnection",
      nextToken?: string | null,
    } | null,
    turnNumber: number,
    gameType: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListBoardsQueryVariables = {
  filter?: ModelBoardFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListBoardsQuery = {
  listBoards?:  {
    __typename: "ModelBoardConnection",
    items:  Array< {
      __typename: "Board",
      id: string,
      turnNumber: number,
      gameType: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetPlayerQueryVariables = {
  id: string,
};

export type GetPlayerQuery = {
  getPlayer?:  {
    __typename: "Player",
    id: string,
    score: number,
    createdAt: string,
    updatedAt: string,
    boardPlayersId?: string | null,
  } | null,
};

export type ListPlayersQueryVariables = {
  filter?: ModelPlayerFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPlayersQuery = {
  listPlayers?:  {
    __typename: "ModelPlayerConnection",
    items:  Array< {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetPieceQueryVariables = {
  id: string,
};

export type GetPieceQuery = {
  getPiece?:  {
    __typename: "Piece",
    id: string,
    type: string,
    color: string,
    x: string,
    y: string,
    createdAt: string,
    updatedAt: string,
    boardPiecesId?: string | null,
  } | null,
};

export type ListPiecesQueryVariables = {
  filter?: ModelPieceFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPiecesQuery = {
  listPieces?:  {
    __typename: "ModelPieceConnection",
    items:  Array< {
      __typename: "Piece",
      id: string,
      type: string,
      color: string,
      x: string,
      y: string,
      createdAt: string,
      updatedAt: string,
      boardPiecesId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetBoardPlayerQueryVariables = {
  id: string,
};

export type GetBoardPlayerQuery = {
  getBoardPlayer?:  {
    __typename: "BoardPlayer",
    id: string,
    player?:  {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null,
    timeLeft: number,
    createdAt: string,
    updatedAt: string,
    boardPlayerPlayerId?: string | null,
  } | null,
};

export type ListBoardPlayersQueryVariables = {
  filter?: ModelBoardPlayerFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListBoardPlayersQuery = {
  listBoardPlayers?:  {
    __typename: "ModelBoardPlayerConnection",
    items:  Array< {
      __typename: "BoardPlayer",
      id: string,
      timeLeft: number,
      createdAt: string,
      updatedAt: string,
      boardPlayerPlayerId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateBoardSubscriptionVariables = {
  filter?: ModelSubscriptionBoardFilterInput | null,
};

export type OnCreateBoardSubscription = {
  onCreateBoard?:  {
    __typename: "Board",
    id: string,
    players?:  {
      __typename: "ModelPlayerConnection",
      nextToken?: string | null,
    } | null,
    pieces?:  {
      __typename: "ModelPieceConnection",
      nextToken?: string | null,
    } | null,
    turnNumber: number,
    gameType: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateBoardSubscriptionVariables = {
  filter?: ModelSubscriptionBoardFilterInput | null,
};

export type OnUpdateBoardSubscription = {
  onUpdateBoard?:  {
    __typename: "Board",
    id: string,
    players?:  {
      __typename: "ModelPlayerConnection",
      nextToken?: string | null,
    } | null,
    pieces?:  {
      __typename: "ModelPieceConnection",
      nextToken?: string | null,
    } | null,
    turnNumber: number,
    gameType: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteBoardSubscriptionVariables = {
  filter?: ModelSubscriptionBoardFilterInput | null,
};

export type OnDeleteBoardSubscription = {
  onDeleteBoard?:  {
    __typename: "Board",
    id: string,
    players?:  {
      __typename: "ModelPlayerConnection",
      nextToken?: string | null,
    } | null,
    pieces?:  {
      __typename: "ModelPieceConnection",
      nextToken?: string | null,
    } | null,
    turnNumber: number,
    gameType: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreatePlayerSubscriptionVariables = {
  filter?: ModelSubscriptionPlayerFilterInput | null,
};

export type OnCreatePlayerSubscription = {
  onCreatePlayer?:  {
    __typename: "Player",
    id: string,
    score: number,
    createdAt: string,
    updatedAt: string,
    boardPlayersId?: string | null,
  } | null,
};

export type OnUpdatePlayerSubscriptionVariables = {
  filter?: ModelSubscriptionPlayerFilterInput | null,
};

export type OnUpdatePlayerSubscription = {
  onUpdatePlayer?:  {
    __typename: "Player",
    id: string,
    score: number,
    createdAt: string,
    updatedAt: string,
    boardPlayersId?: string | null,
  } | null,
};

export type OnDeletePlayerSubscriptionVariables = {
  filter?: ModelSubscriptionPlayerFilterInput | null,
};

export type OnDeletePlayerSubscription = {
  onDeletePlayer?:  {
    __typename: "Player",
    id: string,
    score: number,
    createdAt: string,
    updatedAt: string,
    boardPlayersId?: string | null,
  } | null,
};

export type OnCreatePieceSubscriptionVariables = {
  filter?: ModelSubscriptionPieceFilterInput | null,
};

export type OnCreatePieceSubscription = {
  onCreatePiece?:  {
    __typename: "Piece",
    id: string,
    type: string,
    color: string,
    x: string,
    y: string,
    createdAt: string,
    updatedAt: string,
    boardPiecesId?: string | null,
  } | null,
};

export type OnUpdatePieceSubscriptionVariables = {
  filter?: ModelSubscriptionPieceFilterInput | null,
};

export type OnUpdatePieceSubscription = {
  onUpdatePiece?:  {
    __typename: "Piece",
    id: string,
    type: string,
    color: string,
    x: string,
    y: string,
    createdAt: string,
    updatedAt: string,
    boardPiecesId?: string | null,
  } | null,
};

export type OnDeletePieceSubscriptionVariables = {
  filter?: ModelSubscriptionPieceFilterInput | null,
};

export type OnDeletePieceSubscription = {
  onDeletePiece?:  {
    __typename: "Piece",
    id: string,
    type: string,
    color: string,
    x: string,
    y: string,
    createdAt: string,
    updatedAt: string,
    boardPiecesId?: string | null,
  } | null,
};

export type OnCreateBoardPlayerSubscriptionVariables = {
  filter?: ModelSubscriptionBoardPlayerFilterInput | null,
};

export type OnCreateBoardPlayerSubscription = {
  onCreateBoardPlayer?:  {
    __typename: "BoardPlayer",
    id: string,
    player?:  {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null,
    timeLeft: number,
    createdAt: string,
    updatedAt: string,
    boardPlayerPlayerId?: string | null,
  } | null,
};

export type OnUpdateBoardPlayerSubscriptionVariables = {
  filter?: ModelSubscriptionBoardPlayerFilterInput | null,
};

export type OnUpdateBoardPlayerSubscription = {
  onUpdateBoardPlayer?:  {
    __typename: "BoardPlayer",
    id: string,
    player?:  {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null,
    timeLeft: number,
    createdAt: string,
    updatedAt: string,
    boardPlayerPlayerId?: string | null,
  } | null,
};

export type OnDeleteBoardPlayerSubscriptionVariables = {
  filter?: ModelSubscriptionBoardPlayerFilterInput | null,
};

export type OnDeleteBoardPlayerSubscription = {
  onDeleteBoardPlayer?:  {
    __typename: "BoardPlayer",
    id: string,
    player?:  {
      __typename: "Player",
      id: string,
      score: number,
      createdAt: string,
      updatedAt: string,
      boardPlayersId?: string | null,
    } | null,
    timeLeft: number,
    createdAt: string,
    updatedAt: string,
    boardPlayerPlayerId?: string | null,
  } | null,
};

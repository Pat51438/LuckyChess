/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateBoard = /* GraphQL */ `subscription OnCreateBoard($filter: ModelSubscriptionBoardFilterInput) {
  onCreateBoard(filter: $filter) {
    id
    players {
      nextToken
      __typename
    }
    pieces {
      nextToken
      __typename
    }
    turnNumber
    gameType
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateBoardSubscriptionVariables,
  APITypes.OnCreateBoardSubscription
>;
export const onUpdateBoard = /* GraphQL */ `subscription OnUpdateBoard($filter: ModelSubscriptionBoardFilterInput) {
  onUpdateBoard(filter: $filter) {
    id
    players {
      nextToken
      __typename
    }
    pieces {
      nextToken
      __typename
    }
    turnNumber
    gameType
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateBoardSubscriptionVariables,
  APITypes.OnUpdateBoardSubscription
>;
export const onDeleteBoard = /* GraphQL */ `subscription OnDeleteBoard($filter: ModelSubscriptionBoardFilterInput) {
  onDeleteBoard(filter: $filter) {
    id
    players {
      nextToken
      __typename
    }
    pieces {
      nextToken
      __typename
    }
    turnNumber
    gameType
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteBoardSubscriptionVariables,
  APITypes.OnDeleteBoardSubscription
>;
export const onCreatePlayer = /* GraphQL */ `subscription OnCreatePlayer($filter: ModelSubscriptionPlayerFilterInput) {
  onCreatePlayer(filter: $filter) {
    id
    score
    createdAt
    updatedAt
    boardPlayersId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreatePlayerSubscriptionVariables,
  APITypes.OnCreatePlayerSubscription
>;
export const onUpdatePlayer = /* GraphQL */ `subscription OnUpdatePlayer($filter: ModelSubscriptionPlayerFilterInput) {
  onUpdatePlayer(filter: $filter) {
    id
    score
    createdAt
    updatedAt
    boardPlayersId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdatePlayerSubscriptionVariables,
  APITypes.OnUpdatePlayerSubscription
>;
export const onDeletePlayer = /* GraphQL */ `subscription OnDeletePlayer($filter: ModelSubscriptionPlayerFilterInput) {
  onDeletePlayer(filter: $filter) {
    id
    score
    createdAt
    updatedAt
    boardPlayersId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeletePlayerSubscriptionVariables,
  APITypes.OnDeletePlayerSubscription
>;
export const onCreatePiece = /* GraphQL */ `subscription OnCreatePiece($filter: ModelSubscriptionPieceFilterInput) {
  onCreatePiece(filter: $filter) {
    id
    type
    color
    x
    y
    createdAt
    updatedAt
    boardPiecesId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreatePieceSubscriptionVariables,
  APITypes.OnCreatePieceSubscription
>;
export const onUpdatePiece = /* GraphQL */ `subscription OnUpdatePiece($filter: ModelSubscriptionPieceFilterInput) {
  onUpdatePiece(filter: $filter) {
    id
    type
    color
    x
    y
    createdAt
    updatedAt
    boardPiecesId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdatePieceSubscriptionVariables,
  APITypes.OnUpdatePieceSubscription
>;
export const onDeletePiece = /* GraphQL */ `subscription OnDeletePiece($filter: ModelSubscriptionPieceFilterInput) {
  onDeletePiece(filter: $filter) {
    id
    type
    color
    x
    y
    createdAt
    updatedAt
    boardPiecesId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeletePieceSubscriptionVariables,
  APITypes.OnDeletePieceSubscription
>;
export const onCreateBoardPlayer = /* GraphQL */ `subscription OnCreateBoardPlayer(
  $filter: ModelSubscriptionBoardPlayerFilterInput
) {
  onCreateBoardPlayer(filter: $filter) {
    id
    player {
      id
      score
      createdAt
      updatedAt
      boardPlayersId
      __typename
    }
    timeLeft
    createdAt
    updatedAt
    boardPlayerPlayerId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateBoardPlayerSubscriptionVariables,
  APITypes.OnCreateBoardPlayerSubscription
>;
export const onUpdateBoardPlayer = /* GraphQL */ `subscription OnUpdateBoardPlayer(
  $filter: ModelSubscriptionBoardPlayerFilterInput
) {
  onUpdateBoardPlayer(filter: $filter) {
    id
    player {
      id
      score
      createdAt
      updatedAt
      boardPlayersId
      __typename
    }
    timeLeft
    createdAt
    updatedAt
    boardPlayerPlayerId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateBoardPlayerSubscriptionVariables,
  APITypes.OnUpdateBoardPlayerSubscription
>;
export const onDeleteBoardPlayer = /* GraphQL */ `subscription OnDeleteBoardPlayer(
  $filter: ModelSubscriptionBoardPlayerFilterInput
) {
  onDeleteBoardPlayer(filter: $filter) {
    id
    player {
      id
      score
      createdAt
      updatedAt
      boardPlayersId
      __typename
    }
    timeLeft
    createdAt
    updatedAt
    boardPlayerPlayerId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteBoardPlayerSubscriptionVariables,
  APITypes.OnDeleteBoardPlayerSubscription
>;

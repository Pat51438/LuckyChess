/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getBoard = /* GraphQL */ `query GetBoard($id: ID!) {
  getBoard(id: $id) {
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
` as GeneratedQuery<APITypes.GetBoardQueryVariables, APITypes.GetBoardQuery>;
export const listBoards = /* GraphQL */ `query ListBoards(
  $filter: ModelBoardFilterInput
  $limit: Int
  $nextToken: String
) {
  listBoards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      turnNumber
      gameType
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBoardsQueryVariables,
  APITypes.ListBoardsQuery
>;
export const getPlayer = /* GraphQL */ `query GetPlayer($id: ID!) {
  getPlayer(id: $id) {
    id
    score
    createdAt
    updatedAt
    boardPlayersId
    __typename
  }
}
` as GeneratedQuery<APITypes.GetPlayerQueryVariables, APITypes.GetPlayerQuery>;
export const listPlayers = /* GraphQL */ `query ListPlayers(
  $filter: ModelPlayerFilterInput
  $limit: Int
  $nextToken: String
) {
  listPlayers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      score
      createdAt
      updatedAt
      boardPlayersId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPlayersQueryVariables,
  APITypes.ListPlayersQuery
>;
export const getPiece = /* GraphQL */ `query GetPiece($id: ID!) {
  getPiece(id: $id) {
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
` as GeneratedQuery<APITypes.GetPieceQueryVariables, APITypes.GetPieceQuery>;
export const listPieces = /* GraphQL */ `query ListPieces(
  $filter: ModelPieceFilterInput
  $limit: Int
  $nextToken: String
) {
  listPieces(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPiecesQueryVariables,
  APITypes.ListPiecesQuery
>;
export const getBoardPlayer = /* GraphQL */ `query GetBoardPlayer($id: ID!) {
  getBoardPlayer(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetBoardPlayerQueryVariables,
  APITypes.GetBoardPlayerQuery
>;
export const listBoardPlayers = /* GraphQL */ `query ListBoardPlayers(
  $filter: ModelBoardPlayerFilterInput
  $limit: Int
  $nextToken: String
) {
  listBoardPlayers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      timeLeft
      createdAt
      updatedAt
      boardPlayerPlayerId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBoardPlayersQueryVariables,
  APITypes.ListBoardPlayersQuery
>;

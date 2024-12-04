/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createBoard = /* GraphQL */ `mutation CreateBoard(
  $input: CreateBoardInput!
  $condition: ModelBoardConditionInput
) {
  createBoard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateBoardMutationVariables,
  APITypes.CreateBoardMutation
>;
export const updateBoard = /* GraphQL */ `mutation UpdateBoard(
  $input: UpdateBoardInput!
  $condition: ModelBoardConditionInput
) {
  updateBoard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateBoardMutationVariables,
  APITypes.UpdateBoardMutation
>;
export const deleteBoard = /* GraphQL */ `mutation DeleteBoard(
  $input: DeleteBoardInput!
  $condition: ModelBoardConditionInput
) {
  deleteBoard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteBoardMutationVariables,
  APITypes.DeleteBoardMutation
>;
export const createPlayer = /* GraphQL */ `mutation CreatePlayer(
  $input: CreatePlayerInput!
  $condition: ModelPlayerConditionInput
) {
  createPlayer(input: $input, condition: $condition) {
    id
    score
    createdAt
    updatedAt
    boardPlayersId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreatePlayerMutationVariables,
  APITypes.CreatePlayerMutation
>;
export const updatePlayer = /* GraphQL */ `mutation UpdatePlayer(
  $input: UpdatePlayerInput!
  $condition: ModelPlayerConditionInput
) {
  updatePlayer(input: $input, condition: $condition) {
    id
    score
    createdAt
    updatedAt
    boardPlayersId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdatePlayerMutationVariables,
  APITypes.UpdatePlayerMutation
>;
export const deletePlayer = /* GraphQL */ `mutation DeletePlayer(
  $input: DeletePlayerInput!
  $condition: ModelPlayerConditionInput
) {
  deletePlayer(input: $input, condition: $condition) {
    id
    score
    createdAt
    updatedAt
    boardPlayersId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeletePlayerMutationVariables,
  APITypes.DeletePlayerMutation
>;
export const createPiece = /* GraphQL */ `mutation CreatePiece(
  $input: CreatePieceInput!
  $condition: ModelPieceConditionInput
) {
  createPiece(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreatePieceMutationVariables,
  APITypes.CreatePieceMutation
>;
export const updatePiece = /* GraphQL */ `mutation UpdatePiece(
  $input: UpdatePieceInput!
  $condition: ModelPieceConditionInput
) {
  updatePiece(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdatePieceMutationVariables,
  APITypes.UpdatePieceMutation
>;
export const deletePiece = /* GraphQL */ `mutation DeletePiece(
  $input: DeletePieceInput!
  $condition: ModelPieceConditionInput
) {
  deletePiece(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeletePieceMutationVariables,
  APITypes.DeletePieceMutation
>;
export const createBoardPlayer = /* GraphQL */ `mutation CreateBoardPlayer(
  $input: CreateBoardPlayerInput!
  $condition: ModelBoardPlayerConditionInput
) {
  createBoardPlayer(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateBoardPlayerMutationVariables,
  APITypes.CreateBoardPlayerMutation
>;
export const updateBoardPlayer = /* GraphQL */ `mutation UpdateBoardPlayer(
  $input: UpdateBoardPlayerInput!
  $condition: ModelBoardPlayerConditionInput
) {
  updateBoardPlayer(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateBoardPlayerMutationVariables,
  APITypes.UpdateBoardPlayerMutation
>;
export const deleteBoardPlayer = /* GraphQL */ `mutation DeleteBoardPlayer(
  $input: DeleteBoardPlayerInput!
  $condition: ModelBoardPlayerConditionInput
) {
  deleteBoardPlayer(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteBoardPlayerMutationVariables,
  APITypes.DeleteBoardPlayerMutation
>;

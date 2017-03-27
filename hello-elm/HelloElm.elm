module Main exposing (..)

import Html exposing (Html, div, p, text, button)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Array
import Random


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


greetings : Array.Array String
greetings =
    Array.fromList
        [ "Hello World"
        , "Hola Mundo"
        , "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨਿਆ"
        , "こんにちは世界"
        , "你好世界"
        , "Përshendetje Botë"
        , "مرحبا بالعالم"
        , "Բարեւ, աշխարհ"
        , "হ্যালো দুনিয়া"
        , "Saluton mondo"
        , "გამარჯობა მსოფლიო"
        ]


generate : Cmd Msg
generate =
    let
        upper =
            (Array.length greetings) - 1
    in
        Random.generate NewNumber (Random.int 0 upper)



-- MODEL


type alias Model =
    Int


init : ( Model, Cmd Msg )
init =
    ( 0, generate )



-- UPDATE


type Msg
    = Generate
    | NewNumber Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Generate ->
            ( model, generate )

        NewNumber num ->
            ( num, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    let
        greeting =
            case Array.get model greetings of
                Just i ->
                    i

                Nothing ->
                    "?"
    in
        div []
            [ p [] [ text (toString model) ]
            , p [] [ text greeting ]
            , button [ class "btn btn-primary", onClick Generate ] [ text "Click me!" ]
            ]

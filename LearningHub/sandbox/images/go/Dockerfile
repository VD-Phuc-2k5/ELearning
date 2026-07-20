FROM golang:1.22-alpine
RUN adduser -D -s /bin/sh sandbox
RUN printf 'package main\nimport (\n\t"fmt"; "os"; "strings"; "strconv"; "math"; "sort"; "time"; "io"; "bufio"; "encoding/json"; "errors"; "sync"; "net/http"; "reflect"; "unicode/utf8"\n)\nfunc main() {\n\tfmt.Println(os.Args[0]); _ = strings.Join([]string{}, ""); _ = strconv.Itoa(0); _ = math.Abs(0); sort.Ints([]int{}); _ = time.Now(); _ = io.EOF; _ = bufio.NewReader(nil); _, _ = json.Marshal(nil); _ = errors.New(""); var wg sync.WaitGroup; wg.Done(); _ = http.DefaultClient; _ = reflect.TypeOf(0); _ = utf8.RuneCountInString("")\n}\n' > /tmp/warmup.go && \
  mkdir -p /home/sandbox/go-cache && \
  GOCACHE=/home/sandbox/go-cache go build -o /dev/null /tmp/warmup.go && \
  rm /tmp/warmup.go && \
  chown -R sandbox:sandbox /home/sandbox/go-cache
USER sandbox
WORKDIR /sandbox
